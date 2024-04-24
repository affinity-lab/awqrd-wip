import {ClassMetaData} from "@affinity-lab/awqrd-util/class-meta-data.ts";
import {Client} from "./client/client.ts";

type CometGroupConfig = {
	name?: string
	clients?: Client[]
} & Record<string, any>

export type CometCommandConfig = {
	name?: string
	clients?: Client[]
} & Record<string, any>


export class Comet {
	static readonly classMetaData = new ClassMetaData();

	static Args(target: any, propertyKey: string, index: number) {
		Comet.classMetaData.get(target.constructor, true).set(["params", propertyKey, index.toString()], "args");
	}
	static Files(target: any, propertyKey: string, index: number) {
		Comet.classMetaData.get(target.constructor, true).set(["params", propertyKey, index.toString()], "files");
	}
	static Env(target: any, propertyKey: string, index: number) {
		Comet.classMetaData.get(target.constructor, true).set(["params", propertyKey, index.toString()], "env");
	}
	static Client(target: any, propertyKey: string, index: number) {
		Comet.classMetaData.get(target.constructor, true).set(["params", propertyKey, index.toString()], "client");
	}
	static Ctx(target: any, propertyKey: string, index: number) {
		Comet.classMetaData.get(target.constructor, true).set(["params", propertyKey, index.toString()], "ctx");
	}


	static Command(config: CometCommandConfig = {}): (target: any, propertyKey: string) => void {
		return (target: any, propertyKey: string) => {
			if (config === undefined) config = {};
			if (config.name === undefined) config.name = propertyKey;
			this.classMetaData.get(target.constructor, true)
			for (const key in config) {
				this.classMetaData.get(target.constructor, true).set(["command", propertyKey, key], config[key]);
			}
		}
	}
	static Group(config: CometGroupConfig = {}): (target: any) => void {
		return (target: any) => {
			if (config === undefined) config = {};
			if (config.name === undefined) config.name = target.name;
			this.classMetaData.get(target, true)
			for (const key in config) {
				this.classMetaData.get(target, true).set(["group", key], config[key]);
			}
		}
	}
}
