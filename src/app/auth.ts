import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export interface Member {
  name: string;
  email: string;
  courses: string[];
}

interface StoredAccount extends Member {
  salt: string;
  hash: string;
}

// Browser-only demo backend. Accounts live in this browser's localStorage, so
// this is NOT real security. Swap these helpers for a real auth provider
// (see CLAUDE.md → "Replacing demo auth") and keep the public API the same.
const ACCOUNTS_KEY = 'vitrix.accounts';
const SESSION_KEY = 'vitrix.session';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Storage blocked (private mode); the session just won't persist.
  }
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function toMember({ name, email, courses }: StoredAccount): Member {
  return { name, email, courses };
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly current = signal<Member | null>(this.restore());
  readonly user = this.current.asReadonly();
  readonly signedIn = computed(() => this.current() !== null);

  async register(name: string, email: string, password: string): Promise<void> {
    const accounts = read<StoredAccount[]>(ACCOUNTS_KEY, []);
    const key = email.trim().toLowerCase();
    if (accounts.some((account) => account.email === key)) {
      throw new Error('An account with this email already exists.');
    }
    const salt = crypto.randomUUID();
    const account: StoredAccount = {
      name: name.trim(),
      email: key,
      courses: [],
      salt,
      hash: await hashPassword(password, salt),
    };
    write(ACCOUNTS_KEY, [...accounts, account]);
    this.start(account);
  }

  async login(email: string, password: string): Promise<void> {
    const key = email.trim().toLowerCase();
    const account = read<StoredAccount[]>(ACCOUNTS_KEY, []).find((item) => item.email === key);
    if (!account || account.hash !== (await hashPassword(password, account.salt))) {
      throw new Error('Email or password is incorrect.');
    }
    this.start(account);
  }

  logout(): void {
    write(SESSION_KEY, null);
    this.current.set(null);
  }

  private start(account: StoredAccount): void {
    write(SESSION_KEY, account.email);
    this.current.set(toMember(account));
  }

  private restore(): Member | null {
    const email = read<string | null>(SESSION_KEY, null);
    const account = read<StoredAccount[]>(ACCOUNTS_KEY, []).find((item) => item.email === email);
    return account ? toMember(account) : null;
  }
}

export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(Auth).signedIn()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};
