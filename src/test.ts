

type T_Constructor<T> = (new (...args: any[]) => T);
type T_Class<T, C> = (new (...args: any[]) => T) & C;

type T_WithId<T> = {id:number} & T;


abstract class AbstractEntity {

	declare id:number|undefined|null;

	static staticFunc() {}

	func() {
		console.log("Hello")
	}
	funcb() {
		console.log("World")
	}

}

abstract class AbstractEntityLayer2 extends AbstractEntity{
	static staticFunc2() { }
}

class TheEntity extends AbstractEntityLayer2 {
	func() {
		super.func()
		console.log("World")
	}
	funcc() {
		console.log("World")
	}

}





abstract class AbstractRepo<
	ITEM extends AbstractEntity,
	ENTITY extends T_Class<ITEM, typeof AbstractEntity> = T_Class<ITEM, typeof AbstractEntity>,
> {
	constructor(public entity: ENTITY) {}
	create(): T_WithId<ITEM> {
		this.entity.staticFunc();
		return new (this.entity as T_Constructor<ITEM>)() as T_WithId<ITEM>;
	}
}

abstract class AbstractRepoLayer2<ENTITY extends AbstractEntity> extends AbstractRepo<ENTITY> {
	x() {
		this.create().func();
	}
}


abstract class AbstractRepoLayerOfEntityLayer2<ENTITY extends AbstractEntityLayer2> extends AbstractRepo<ENTITY> {
	xy() {
		this.create().func();
		this.entity.staticFunc()
	}
}




class TheRepo extends AbstractRepoLayer2<TheEntity> {
	x() {
		this.create().func();
	}
}

class TheRepo2 extends AbstractRepoLayerOfEntityLayer2<TheEntity> {
	xyz() {
		this.create().func();
	}
}


let a = new TheRepo(TheEntity)
a.x();
a.create().funcc();
a.create().id;

let b = new TheRepo2(TheEntity)
b.create().funcc()
b.xyz()