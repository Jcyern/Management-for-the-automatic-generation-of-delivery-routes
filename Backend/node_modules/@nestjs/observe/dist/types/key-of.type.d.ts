export type KeyOf<T> = keyof T extends never ? string | symbol : keyof T;
