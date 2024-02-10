export function isAbsoluteNumber(value: number) {
    // Check if the value is a number and its absolute value is equal to the original value
    return typeof value === 'number' && Math.abs(value) === value;
}