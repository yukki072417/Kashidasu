const adminModel = require('../../model/adminModel');

describe('Admin Model testing of valid test case.', () => {

    const testCase = {
        admin_id: '0123456789',
        password: 'password'
    }

    test('Create admin with valid data.', async () => {
        const admin = await adminModel.createAdmin(testCase.admin_id, testCase.password);
        expect(admin.admin_id).toBe(testCase.admin_id);
    });

    test('Get admin with valid data', async () => {
        const admin = await adminModel.getAdmin(testCase.admin_id);
        expect(admin).toStrictEqual(testCase);
    });

    test('Update admin password with valid data.', async () => {
        const admin = await adminModel.updateAdmin(testCase.admin_id, '9876543210', 'new_password');
        expect(admin).toBe(1);
    });

    test('Delete admin with valid data.', async () => {
        const admin = await adminModel.deleteAdmin('9876543210');
        expect(admin).toBe(1);
    });
});