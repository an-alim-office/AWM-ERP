FROM node:18-alpine

WORKDIR /app

# ডিপেন্ডেন্সি ইনস্টল করার জন্য package.json কপি করা
COPY package*.json ./

# নোড মডিউলস ইনস্টল করা
RUN npm install

# প্রজেক্টের বাকি সব ফাইল কপি করা
COPY . .

# নেক্সট জেএস প্রজেক্ট বিল্ড করা
RUN npm run build

# পোর্ট এক্সপোজ করা
EXPOSE 3000

# প্রোডাকশন সার্ভার স্টার্ট করা
CMD ["npm", "start"]