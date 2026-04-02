
export const up = (pgm) => {
    pgm.createTable('recruiters', {
        id: 'id',
        email: { type: 'varchar(255)', notNull: true, unique: true },
        password: { type: 'varchar(255)', notNull: true },
        cname: { type: 'varchar(255)', notNull: true },
        owner: { type: 'varchar(255)', notNull: true },
        category: { type: 'categories', default: null },
        employee_size_min: { type: 'integer', default: 0 },
        employee_size_max: { type: 'integer', default: 0 },
        company_website: { type: 'varchar(255)', default: null },
        company_logo: { type: 'varchar(255)', default: null },
        profile_completed: { type: 'boolean', default: false },
        email_verified: { type: 'boolean', default: false },
        refresh_token: { type: 'varchar(255)', default: null },
        createdAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        updatedAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    })
};

export const down = (pgm) => {
    pgm.dropTable('recruiters');
};