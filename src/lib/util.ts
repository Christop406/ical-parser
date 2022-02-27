export const splitICSLines = (ics: string) => {
    return ics
        .replace(/\r\n\s/g, "")
        .replace(/\\n/g, " ")
        .replace(/  +/g, ' ')
        .replace(/\\/g, "")
        .split("\n");
};