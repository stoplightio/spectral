const PROTOCOL_REGEX = /^[a-z]+:\/\//i;

export const startsWithProtocol = (input: string) => PROTOCOL_REGEX.test(input);
