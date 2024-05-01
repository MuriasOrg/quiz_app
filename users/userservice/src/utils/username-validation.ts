import { Request } from 'express';

function validateNoSpaces(req: Request, fieldsThatCannotHaveSpace: string[]) {
    for (const field of fieldsThatCannotHaveSpace) {
        if (req.body[field]?.indexOf(' ') >= 0) {
            throw new Error(`The field "${field}" cannot have spaces`);
        }
    }
}

export { validateNoSpaces };