export const up = (pgm) => {
    pgm.createTable('skills', {
        id: 'id',
        name: { type: 'varchar(255)', notNull: true, unique: true },
        createdAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        updatedAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    })
};

export const down = (pgm) => {
    pgm.dropTable('skills');
};