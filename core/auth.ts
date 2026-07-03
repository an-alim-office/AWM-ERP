export const login = async (email: string, password: string) => {
  try {
    // fake API (later replace with real API)
    if (email === "admin@gmail.com" && password === "123456") {
      return {
        success: true,
        token: "fake-jwt-token",
      };
    }

    return {
      success: false,
      message: "Invalid credentials",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};