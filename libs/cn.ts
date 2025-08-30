import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...args: ClassValue[]): string => twMerge(clsx(...args));

export { cn };
