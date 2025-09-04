declare const brand: unique symbol;

export type Brand<T, TBrandName extends string> = Readonly<{ [brand]: TBrandName }> & T;
