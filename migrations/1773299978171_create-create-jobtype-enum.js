
export const up = (pgm) => {
    pgm.createType('jobtypes', ['Full Time', 'Part Time'])
};

export const down = (pgm) => {
    pgm.dropType('jobtypes')
};
