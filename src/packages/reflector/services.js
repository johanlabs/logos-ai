const updateUserDailyReflection = async (phoneNumber, status) => {
    try {
        const user = await prisma.user.findUnique({
            where: { phoneNumber },
        });

        if (!user) {
            throw new Error('User not found.');
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { dailyReflection: status },
        });

        return updatedUser;
    } catch (error) {
        console.error("User Updating Error:", error);

        throw error;
    }
}

module.exports = { updateUserDailyReflection }
