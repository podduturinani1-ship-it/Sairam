import axios from 'axios';

const run = async () => {
  try {
    // First login to get a token
    const { data: userData } = await axios.post('http://localhost:5000/api/users/login', {
      email: 'test@example.com', // Need a valid user, or we can just bypass if we know one, let's try
      password: 'password'
    });
    console.log(userData);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
};
run();
