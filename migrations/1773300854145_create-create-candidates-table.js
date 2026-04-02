
export const up = (pgm) => {
    pgm.createTable('candidates', {
        id: 'id',
        fname: { type: 'varchar(255)', notNull: true },
        email: { type: 'varchar(255)', notNull: true, unique: true },
        password: { type: 'varchar(255)', notNull: true },
        description: { type: 'text', default: null },
        experience_years_min: { type: 'integer', default: 0 },
        experience_years_max: { type: 'integer', default: 0 },
        resume_url: { type: 'varchar(255)', default: null },
        expected_salary_min: { type: 'integer', default: 0 },
        expected_salary_max: { type: 'integer', default: 0 },
        category: { type: 'categories' },
        profile_completed: { type: 'boolean', default: false },
        email_verified: { type: 'boolean', default: false },
        refresh_token: { type: 'varchar(255)', default: null },
        createdAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
        updatedAt: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    })
};

export const down = (pgm) => {
    pgm.dropTable('candidates');
};