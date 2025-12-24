const adminModel = require('../../model/adminModel');

const testCase = {
    admin_id: '0123456789',
    password: 'password'
}

describe('Admin Model testing of valid test case.', () => {

    test('Create admin with valid data.', async () => {
        // Clean up any previous test runs first
        await adminModel.deleteAdmin(testCase.admin_id);
        await adminModel.deleteAdmin('9876543210');

        const admin = await adminModel.createAdmin(testCase.admin_id, testCase.password);
        expect(admin.admin_id).toBe(testCase.admin_id);
    });

    test('Get admin with valid data', async () => {
        const admin = await adminModel.getAdmin(testCase.admin_id);
        expect(admin.admin_id).toStrictEqual(testCase.admin_id);
    });

    test('Authenticate admin with valid data should return true.', async () => {
        const result = await adminModel.authenticateAdmin(testCase.admin_id, testCase.password);
        expect(result).toBe(true);
    });

    test('Update admin password with valid data.', async () => {
        const affectedRows = await adminModel.updateAdmin(testCase.admin_id, '9876543210', 'new_password');
        expect(affectedRows).toBe(1);
    });

    test('Delete admin with valid data.', async () => {
        const affectedRows = await adminModel.deleteAdmin('9876543210');
        expect(affectedRows).toBe(1);
    });
});

describe('Admin Model testing of invalid test case.', () => {
    const emptyIdOrPasswordError = 'Cannot empty adminId and password.';
    const emptyIdError = 'Cannot empty adminId.';
    const notFoundError = 'Admin not found.';

    beforeAll(async () => {
        // Ensure a known state for authentication tests
        await adminModel.createAdmin(testCase.admin_id, testCase.password);
    });

    afterAll(async () => {
        // Clean up the created admin
        await adminModel.deleteAdmin(testCase.admin_id);
    });

    // createAdmin
    test('Create admin with null adminId should throw error.', async () => {
        await expect(adminModel.createAdmin(null, testCase.password)).rejects.toThrow(emptyIdOrPasswordError);
    });
    test('Create admin with empty password should throw error.', async () => {
        await expect(adminModel.createAdmin(testCase.admin_id, '')).rejects.toThrow(emptyIdOrPasswordError);
    });

    // getAdmin
    test('Get admin with null adminId should throw error.', async () => {
        await expect(adminModel.getAdmin(null)).rejects.toThrow(emptyIdError);
    });
    test('Get admin with non-existent adminId should throw error.', async () => {
        await expect(adminModel.getAdmin('non-existent-id')).rejects.toThrow(notFoundError);
    });

    // authenticateAdmin
    test('Authenticate admin with null adminId should throw error.', async () => {
        await expect(adminModel.authenticateAdmin(null, testCase.password)).rejects.toThrow(emptyIdOrPasswordError);
    });
    test('Authenticate admin with empty password should throw error.', async () => {
        await expect(adminModel.authenticateAdmin(testCase.admin_id, '')).rejects.toThrow(emptyIdOrPasswordError);
    });
    test('Authenticate with non-existent adminId should return false.', async () => {
        const result = await adminModel.authenticateAdmin('non-existent-id', testCase.password);
        expect(result).toBe(false);
    });
    test('Authenticate with wrong password should return false.', async () => {
        const result = await adminModel.authenticateAdmin(testCase.admin_id, 'wrong-password');
        expect(result).toBe(false);
    });

    // updateAdmin
    test('Update admin with null adminId should throw error.', async () => {
        await expect(adminModel.updateAdmin(null, 'id', 'pw')).rejects.toThrow(emptyIdOrPasswordError);
    });
    test('Update admin with empty changedAdminId should throw error.', async () => {
        await expect(adminModel.updateAdmin('id', '', 'pw')).rejects.toThrow(emptyIdOrPasswordError);
    });
    test('Update admin with null changedPassword should throw error.', async () => {
        await expect(adminModel.updateAdmin('id', 'newId', null)).rejects.toThrow(emptyIdOrPasswordError);
    });

    // deleteAdmin
    test('Delete admin with null adminId should throw error.', async () => {
        await expect(adminModel.deleteAdmin(null)).rejects.toThrow(emptyIdError);
    });

    test('Delete admin with non-existent adminId should return 0.', async () => {
        const affectedRows = await adminModel.deleteAdmin('non-existent-id');
        expect(affectedRows).toBe(0);
    });
});