const PROTOCOL_REGEX = /^[a-z]+:\/\//i;

export const startsWithProtocol = (input: string): boolean => PROTOCOL_REGEX.test(input);
