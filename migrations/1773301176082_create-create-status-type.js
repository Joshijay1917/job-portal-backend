
export const up = (pgm) => {
    pgm.createType('status', ['Applied', 'Shortlisted', 'Rejected'])
};

export const down = (pgm) => {
    pgm.dropType('status')
};
