// Define email template types
export type EmailType = 'otp' | 'support' | 'bloodRequest';

// Function to generate dynamic HTML content based on template type
const generateEmailTemplate = (type: EmailType, data: any): string => {
    console.log(type, data);
    switch (type) {
        case 'otp':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>ব্লাড ডোনার</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>যাচাইকরণ কোড</h3>
                        <p>প্রিয় ব্যবহারকারী,</p>
                        <p>আপনার অ্যাকাউন্ট যাচাইকরণের জন্য ওটিপি হল:</p>
                        <div style="text-align: center; padding: 15px; background-color: #f5f5f5; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                            ${data.otp}
                        </div>
                        <p>এই কোডটি ১০ মিনিটের মধ্যে মেয়াদ শেষ হবে।</p>
                        <p>আপনি যদি এই কোড অনুরোধ না করে থাকেন, তাহলে অনুগ্রহ করে এই ইমেলটি উপেক্ষা করুন।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার টিম</p>
                    </div>
                </div>
            `;
            
        case 'support':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>ব্লাড ডোনার সাপোর্ট</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>${data.supportTitle || 'সাপোর্ট প্রতিক্রিয়া'}</h3>
                        <p>প্রিয় ${data.name},</p>
                        <p>${data.message}</p>
                        <p>আপনার যদি আরও কোন প্রশ্ন থাকে, তাহলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করতে দ্বিধা করবেন না।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার সাপোর্ট টিম</p>
                    </div>
                </div>
            `;
            
        case 'bloodRequest':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; padding: 10px; background-color: #f44336; color: white;">
                        <h2>জরুরী রক্ত দরকার</h2>
                    </div>
                    <div style="padding: 20px;">
                        <h3>রক্তদান অনুরোধ</h3>
                        <p>প্রিয় ${data?.name},</p>
                        <p>আমাদের কাছে <strong>${data.bloodGroup}</strong> রক্তের একটি জরুরী অনুরোধ এসেছে:</p>
                        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
                            <p><strong>হাসপাতাল:</strong> ${data.hospital}</p>
                            <p><strong>ঠিকানা:</strong> ${data.address}</p>
                            <p><strong>যোগাযোগ:</strong> ${data.contact}</p>
                            <p><strong>প্রয়োজনীয় সময়:</strong> ${data.requiredBy}</p>
                        </div>
                        <p>আপনার রক্তদান একটি জীবন বাঁচাতে পারে। আপনি যদি রক্তদান করতে পারেন, তাহলে অনুগ্রহ করে এই ইমেইলের উত্তর দিন অথবা প্রদত্ত নম্বরে যোগাযোগ করুন।</p>
                        <p>আপনার দয়া এবং উদারতার জন্য ধন্যবাদ।</p>
                        <p>শুভেচ্ছান্তে,<br>ব্লাড ডোনার টিম</p>
                    </div>
                </div>
            `;
            
        default:
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h3>ব্লাড ডোনার থেকে বার্তা</h3>
                    <p>${data.message}</p>
                </div>
            `;
    }
};

export default generateEmailTemplate;