import {ZodObject} from "zod";
import {ClassMetaData} from "../util/class-meta-data.ts";
import {Client} from "./client/client.ts";

type CometGroupConfig = {
	name?: string,
	clients?: Client[]
} & Record<string, any>

type CacheOptions = {
	ttl: number
}

export type CometCommandConfig = {
	name?: string,
	clients?: Client[],
	preprocess?: (args: Record<string, any>) => void,
	cache?: CacheOptions,
	validate?: ZodObject<any> // TODO
} & Record<string, any>


export class Comet {
	static readonly classMetaData = new ClassMetaData();

	static Command(config: CometCommandConfig = {}): (target: any, propertyKey: string) => void {
		return (target: any, propertyKey: string) => {
			if(config === undefined) config = {};
			if(config.name === undefined) config.name = propertyKey;
			this.classMetaData.get(target.constructor, true)
			for (const key in config) {
				this.classMetaData.get(target.constructor, true).set(["command", propertyKey, key], config[key]);
			}
		}
	}
	static Group(config: CometGroupConfig = {}): (target: any) => void {
		return (target: any) => {
			if(config === undefined) config = {};
			if(config.name === undefined) config.name = target.name;
			this.classMetaData.get(target, true)
			for (const key in config) {
				this.classMetaData.get(target, true).set(`group.${key}`, config[key]);
			}
		}
	}
}
