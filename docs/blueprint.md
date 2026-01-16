# **App Name**: ShelfWatch

## Core Features:

- Firebase Authentication: Implement secure user authentication with email/password, including login, signup, and forgot password flows, integrated with Firebase.
- Inventory Management: Enable users to add, edit, and delete inventory items with details like name, category, quantity, expiry date, and notes, stored in Firestore.
- AI-Powered Item Scanning: Integrate Genkit to analyze images from the device's camera, extract item name, expiry date, and category, and pre-fill the 'Add Item' dialog as a tool for users.
- Expiry Date Tracking: Monitor inventory items' expiry dates and update item status as 'GOOD', 'EXPIRING_SOON', or 'EXPIRED'.
- Status Summary: Display an overview of inventory status using cards for 'Total Items', 'Good', 'Expiring Soon', 'Expired', and 'Out of Stock', functioning as filters on the inventory list.
- Inventory List: Show all inventory items in a filterable and searchable list. Implement desktop (Table) and mobile (Card) views with highlighting for expired/expiring items and actions (Edit/Delete).
- Realtime Alerts: Show real-time alerts in a notification dropdown for expiring or expired items in the header, with mobile-friendly navigation.

## Style Guidelines:

- Background color: Dark gray (#222222) to provide a professional and modern feel, fitting the dark mode theme.
- Primary color: Blue-purple (#6A5ACD) to convey trust and innovation for main interactive elements and calls to action.
- Accent color: Soft lavender (#E6E6FA) to provide contrast to primary elements.
- Destructive color: Red (#FF4500) for delete buttons.
- Alerts: Orange/yellow (#FFC107) for warnings about expiring items.
- Headline font: 'Space Grotesk' (sans-serif) for a tech-forward, contemporary aesthetic in headers.
- Body font: 'Inter' (sans-serif) for readability and a modern feel in all body text.
- lucide-react library icons: Utilize consistent, clean icons from lucide-react for a modern look and enhanced UX. Display the app name 'ShelfWatch' with the Package icon as logo in the header.
- Modern layout: Clean and professional with rounded corners and subtle shadows. Mobile-friendly responsive design adapting content to display size with appropriate UI elements.
- Subtle animations: Gentle transitions and loading states to enhance user engagement without distraction.