
const User = require('../Model/UserSchema.js');
const Otp = require('../Model/OtpSchema.js');
const { sendEmail } = require('../Service/otpEmail.js');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.UserRegister = async (req, res) => {
    const { username, email, password,role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.verified) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        if (existingUser && !existingUser.verified) {
            await User.deleteOne({ _id: existingUser._id });
        }

        if (role && !['User', 'Admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password:hashedPassword,
            role:role,
            verified: false,
        });
        await newUser.save();
        const otpCode = crypto.randomInt(100000, 999999).toString();

        const otpEntry = new Otp({
            userId: newUser._id,
            otp: otpCode,
        });
        await otpEntry.save();

        const emailResponse = await sendEmail(email, otpCode);
        if (emailResponse.success) {
            res.status(200).json({ message: 'User registered, OTP sent to email for verification' });
        } else {
            res.status(500).json({ message: 'Failed to send OTP email' });
        }
    } catch (error) {
        res.status(500).json({ message: `Registration failed: ${error.message}` });
    }
};


exports.verifyOtp = async (req, res) => {
    const { email, otpCode } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: 'please register first' });
        }

        console.log(existingUser,"existing user");
        const otpEntry = await Otp.findOne({ userId: existingUser._id, otp: otpCode });
        if (!otpEntry) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        await User.findByIdAndUpdate(existingUser._id, { verified: true });
        await Otp.deleteOne({ userId: existingUser._id, otp: otpCode });
        res.status(200).json({ message: 'OTP verified successfully, account is now verified' });
    } catch (error) {
        res.status(500).json({ message: `OTP verification failed: ${error.message}` });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist. Please register first.' });
        }

        if (!user.verified) {
            return res.status(400).json({ message: 'Please verify your email to log in.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Incorrect password.' });
        }

        const token = jwt.sign(
            { userId: user._id,
                role:user.role
             },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: `Login failed: ${error.message}` });
    }
};




// response = sendSMS(
//     apikey="NDU1MzQ1NDczMDY0NjI2YjQ4NDU1Njc1NmM3MDcyNmI=",
//     numbers=self.phone,
//     sender="PIXIND",
//     message=message
// )


// message = f"Dear Customer, Your Complaint ID is {complaint_id} and OTP is {generated_otp}, will be attended within 72 hours, For Support Call to AMYUSH/PIXELS +91-9214036163"
        

// def sendSMS(apikey, numbers, sender, message):
//     data = urllib.parse.urlencode({'apikey': apikey, 'numbers': numbers,
//                                    'message': message, 'sender': sender})
//     data = data.encode('utf-8')
//     request = urllib.request.Request("https://api.textlocal.in/send/?")
//     with urllib.request.urlopen(request, data) as f:
//         fr = f.read()
//     return fr