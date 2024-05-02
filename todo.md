# New Sapphire features
- [ ] form-adapter,
- [ ] list-adapter,
- [ ] file kezelés
- [ ] sapphire-com

### endpoints
- list
- form
- save
- delete
- file
- collection
- changefiledata
- deletefiledata
- changefileorder

### tags
- rename / merge
- get (by group)

# Storm Cache Plugin
- [x] mapCache invalidation
- [x] mapCache autofill

# Storm Tag Plugin
- [ ] schema factory
- [ ] abstract tag repo
- [ ] plugin

# Storm cached getBy
- [x] Make cacheable getBy methods in Storm

# Storm storage testing
- [ ] Test storage methods in Storm
- [ ] Test delete related methods

- [x] Move exportfields to static prop
```ts
	@MaterializeIt
private static get exportFields(): Array<string> | undefined {
    return Export.metadata.read(this.constructor)?.export;
    }

    $export() {
    const e: Record<string, any> = {}
    let a = this.constructor.prototype.exportFields;
    if(a) for (const key of a) e[key] = this[key as keyof this];
    return e
    }
```