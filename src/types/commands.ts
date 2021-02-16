import { Channel, Collection, Emoji, Guild, Member, Message, Permission, Role } from "../../deps.ts";

export enum PermissionLevels {
  MEMBER,
  MODERATOR,
  ADMIN,
  SERVER_OWNER,
  BOT_SUPPORT,
  BOT_DEVS,
  BOT_OWNER,
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type Identity<T> = { [P in keyof T]: T[P] };

// Define each of the types here
type BaseDefinition = {
  lowercase?: boolean;
  minimum?: number;
  maximum?: number;
  defaultValue?: unknown;
};
type BooleanArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "boolean";
};
type BooleanOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "boolean";
  required: false;
};
type StringArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "string" | "...string" | "subcommand" | "snowflake";
};
type StringOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "string" | "...string" | "subcommand" | "snowflake";
  required: false;
};
type MultiStringArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "...snowflake";
};
type MultiStringOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "...snowflake";
  required: false;
};
type NumberArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "number" | "duration";
};
type NumberOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "number" | "duration";
  required: false;
};
type EmojiArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "emoji";
};
type EmojiOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "emoji";
  required: false;
};
type MultiEmojiArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "...emojis";
};
type MultiEmojiOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "...emojis";
  required: false;
};
type MemberArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "member";
};
type MemberOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "member";
  required: false;
};
type RoleArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "role";
};
type RoleOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "role";
  required: false;
};
type MultiRoleArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "...roles";
};
type MultiRoleOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "...roles";
  required: false;
};
type ChannelArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "categorychannel" | "newschannel" | "textchannel" | "guildtextchannel" | "voicechannel";
};
type ChannelOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "categorychannel" | "newschannel" | "textchannel" | "guildtextchannel" | "voicechannel";
  required: false;
};
type CommandArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "command" | "nestedcommand";
};
type CommandOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "command" | "nestedcommand";
  required: false;
};
type GuildArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "guild";
};
type GuildOptionalArgumentDefinition<N extends string = string> = BaseDefinition & {
  name: N;
  type: "guild";
  required: false;
};

// Add each of known ArgumentDefinitions to this union.
type ArgumentDefinition =
  | BooleanArgumentDefinition
  | StringArgumentDefinition
  | StringOptionalArgumentDefinition
  | MultiStringArgumentDefinition
  | MultiStringOptionalArgumentDefinition
  | NumberArgumentDefinition
  | EmojiArgumentDefinition
  | EmojiOptionalArgumentDefinition
  | MultiEmojiArgumentDefinition
  | MultiEmojiOptionalArgumentDefinition
  | MemberArgumentDefinition
  | RoleArgumentDefinition
  | MultiRoleArgumentDefinition
  | RoleOptionalArgumentDefinition
  | MultiRoleOptionalArgumentDefinition
  | ChannelOptionalArgumentDefinition
  | ChannelArgumentDefinition
  | CommandArgumentDefinition
  | GuildArgumentDefinition;

// OPTIONALS MUST BE FIRST!!!
export type ConvertArgumentDefinitionsToArgs<T extends readonly ArgumentDefinition[]> = Identity<
  UnionToIntersection<
    {
      [P in keyof T]: T[P] extends BooleanOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: boolean }
        : T[P] extends BooleanArgumentDefinition<infer N>
        ? { [_ in N]: boolean }
        : T[P] extends StringOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: string }
        : T[P] extends StringArgumentDefinition<infer N>
        ? { [_ in N]: string }
        : T[P] extends MultiStringOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: string[] }
        : T[P] extends MultiStringArgumentDefinition<infer N>
        ? { [_ in N]: string[] }
        : T[P] extends NumberOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: number }
        : T[P] extends NumberArgumentDefinition<infer N>
        ? { [_ in N]: number }
        : T[P] extends EmojiOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: string }
        : T[P] extends EmojiArgumentDefinition<infer N>
        ? { [_ in N]: Emoji | string }
        : T[P] extends EmojiOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: Emoji | string }
        : T[P] extends MemberOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: Member }
        : T[P] extends MemberArgumentDefinition<infer N>
        ? { [_ in N]: Member }
        : T[P] extends RoleOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: Role }
        : T[P] extends RoleArgumentDefinition<infer N>
        ? { [_ in N]: Role }
        : T[P] extends MultiRoleOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: Role[] }
        : T[P] extends MultiRoleArgumentDefinition<infer N>
        ? { [_ in N]: Role[] }
        : T[P] extends ChannelOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: Channel }
        : T[P] extends ChannelArgumentDefinition<infer N>
        ? { [_ in N]: Channel }
        : T[P] extends CommandOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: Command<T> }
        : T[P] extends CommandArgumentDefinition<infer N>
        ? { [_ in N]: Command<T> }
        : T[P] extends GuildOptionalArgumentDefinition<infer N>
        ? { [_ in N]?: Guild }
        : T[P] extends GuildArgumentDefinition<infer N>
        ? { [_ in N]: Guild }
        : never;
    }[number]
  >
>;

export interface Command<T extends readonly ArgumentDefinition[]> {
  name: string;
  aliases?: string[];
  dmOnly?: boolean;
  guildOnly?: boolean;
  nsfw?: boolean;
  permissionLevels?:
    | PermissionLevels[]
    | ((message: Message, command: Command<T>, guild?: Guild) => boolean | Promise<boolean>);
  botServerPermissions?: Permission[];
  botChannelPermissions?: Permission[];
  userServerPermissions?: Permission[];
  userChannelPermissions?: Permission[];
  description?: string;
  cooldown?: {
    seconds: number;
    allowedUses?: number;
  };
  arguments?: T;
  subcommands?: Collection<string, Command<T>>;
  usage?: string | string[];
  execute?: (message: Message, args: ConvertArgumentDefinitionsToArgs<T>, guild?: Guild) => unknown | Promise<unknown>;
}

export interface Argument {
  name: string;
  execute<T extends readonly ArgumentDefinition[]>(
    arg: CommandArgument,
    parameter: string[],
    message: Message,
    command: Command<T>
  ): unknown;
}

export interface CommandArgument {
  /** The name of the argument. Useful for when you need to alert the user X arg is missing. */
  name: string;
  /** The type of the argument you would like. Defaults to string. */
  type?:
    | "number"
    | "emoji"
    | "string"
    | "...string"
    | "boolean"
    | "subcommand"
    | "member"
    | "role"
    | "...roles"
    | "categorychannel"
    | "newschannel"
    | "textchannel"
    | "guildtextchannel"
    | "voicechannel"
    | "command"
    | "duration"
    | "guild"
    | "snowflake"
    | "...snowflake"
    | "nestedcommand";
  /** The function that runs if this argument is required and is missing. */
  missing?: (message: Message) => unknown;
  /** Whether or not this argument is required. Defaults to true. */
  required?: boolean;
  /** If the type is string, this will force this argument to be lowercase. */
  lowercase?: boolean;
  /** If the type is string or subcommand you can provide literals. The argument MUST be exactly the same as the literals to be accepted. For example, you can list the subcommands here to make sure it matches. */
  literals?: string[];
  /** The default value for this argument/subcommand. */
  defaultValue?: string | boolean | number;
  /** If the type is number set the minimum amount. By default the minimum is 0 */
  minimum?: number;
  /** If the type is a number set the maximum amount. By default this is disabled. */
  maximum?: number;
  /** If the type is a number, you can use this to allow/disable non-integers. By default this is false. */
  allowDecimals?: boolean;
}
