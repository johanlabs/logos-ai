const {
    createUser,
    authenticateUser,
    verifyToken,
    getUser
} = require('./services');

module.exports = [
    {
        method: 'post',
        router: "register",
        call: async (req, res) => {
            const { email, name, password } = req.body;

            try {
                const newUser = await createUser(email, name, password);
                res.status(201).json({ message: 'User created successfully!', user: newUser });
            } catch (error) {
                res.status(500).json({ message: 'Error creating user', error });
            }
        }
    },
    {
        method: 'post',
        router: "login",
        call: async (req, res) => {
            const { email, password } = req.body;

            try {
                const token = await authenticateUser(email, password);
                res.json({ message: 'Login successful!', token });
            } catch (error) {
                res.status(401).json({ message: 'Error logging in' });
            }
        }
    },
    {
        method: 'get',
        router: "profile",
        call: [ verifyToken, async (req, res) => {
            res.json(await getUser(req.user?.id));
        }]
    }
];
