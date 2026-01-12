export type FieldType =
	| "SHORT_TEXT"
	| "LONG_TEXT"
	| "RICH_TEXT"
	| "NUMBER"
	| "BOOLEAN"
	| "DATETIME"
	| "MEDIA"
	| "RELATION";

export type RelationType = "ONE_TO_ONE" | "ONE_TO_MANY" | "MANY_TO_MANY";

export interface FieldDto {
	id?: number;
	name: string;
	fieldName: string;
	type: FieldType;
	required?: boolean;
	unique?: boolean;
	targetContentType?: string | null;
	relationType?: RelationType | null;
}

export interface ContentTypeDto {
	id: number;
	name: string;
	pluralName: string;
	apiId: string;
	description?: string | null;
	fields: FieldDto[];
	createdAt?: string;
	updatedAt?: string;
}

export interface AuthResponse {
	token: string;
	refreshToken: string;
	type: string;
	userId: number;
	username: string;
	email: string;
	roles: string[];
}

export interface UserDto {
	id: number;
	username: string;
	email: string;
	firstname?: string;
	lastname?: string;
	roles: string[];
	enabled?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface MediaDto {
	id: number;
	name: string;
	alternativeText?: string | null;
	caption?: string | null;
	width?: number | null;
	height?: number | null;
	hash: string;
	ext?: string | null;
	mime?: string | null;
	size?: number | string | null;
	url?: string | null;
	provider?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface ApiPermissionDto {
	id: number;
	contentTypeApiId: string;
	endpoint: string;
	method: string;
	allowedRoles: string[];
	createdAt?: string;
}

export interface ContentPermissionDto {
	id: number;
	contentTypeApiId: string;
	action: string;
	allowedRoles: string[];
	createdAt?: string;
}

export type ContentEntry = Record<string, unknown>;
