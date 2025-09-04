# Brand type helper

This tiny type helper encodes intent in types with zero runtime cost. It lets you give distinct meaning to primitives so the compiler prevents accidental mixing. An age is not just a number. A UserId is not any string. The brand exists only at compile time, so there is no allocation or overhead at runtime.

The brand marks the value with a name. You can still use the value where the underlying primitive is expected. The converse is blocked. A plain primitive is not assignable to a branded type. This lets the code as written teach the developer domain concepts while they learn the codebase. Call sites become self documenting and refactors are safer because the compiler enforces intent.

TypeScript is structurally typed, so two values with the same shape are interchangeable even when their meaning is different. That is useful for flexibility but risky when `UserId` and `OrderId` are both just `string`. Languages like Java and C# are nominally typed, so type identity comes from the declared name and the runtime keeps metadata that enforces those identities during casts. TypeScript erases types at runtime, so it cannot protect you there. Branding bridges that gap: it adds nominal meaning at compile time while keeping the structural style and zero runtime cost, so `Brand<string, "UserId">` is not assignable to `Brand<string, "OrderId">`, but either is still usable where a plain `string` is required.

## Usage

Define a branded alias for a primitive. Assert the brand once, at the boundary after validation, then pass the branded value through your code.

```ts
type Age = Brand<number, "Age">;

const myAge = 22 as Age;

function add(age: Age, value: number): number {
  return age + value;
}

const ok = add(myAge, 10); // ok
const err = add(10, 2);    // error: number is not assignable to Age
```

You can prevent cross contamination between values that share the same underlying type by giving them different brand names.

```ts
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

declare const userId: UserId;
declare const orderId: OrderId;

function loadUser(id: UserId) { /* ... */ }

loadUser(userId);  // ok
loadUser(orderId); // error: OrderId is not assignable to UserId
```

When an API only needs the primitive, accept the primitive type. A branded value is still assignable to the primitive without a cast, so callers keep their safety and you keep a simple surface.

## Guidance

Validate and brand at input edges such as parsing, network IO, or user input. Avoid scattering ad hoc assertions inside inner code because that can hide missing checks. Using branded values in hot loops is fine. There is no extra cost at use time. The only step is the one time validation and assertion at creation.

Keep brand names stable and descriptive so diagnostics read well. Use brands where confusion is costly such as identifiers, units, currency amounts, and user entered fields.

## Notes

Brands are compile time only. They do not survive serialization. When data crosses a boundary, validate first and then re apply the brand. This keeps runtime fast while giving you strong feedback during development.
