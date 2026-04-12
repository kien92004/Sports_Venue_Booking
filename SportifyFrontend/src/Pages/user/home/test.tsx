// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useLocation } from 'react-router-dom';

// interface CardInfo {
//   username: string;
//   cardNumber: string;
//   cardType: string;
//   bankCode: string;
// }

// const PaymentMethodPage: React.FC = () => {
//   const [username, setUsername] = useState<string>('');
//   const [cardType, setCardType] = useState<string>('');
//   const [bankCode, setBankCode] = useState<string>('');
//   const [cards, setCards] = useState<CardInfo[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>('');

//   const location = useLocation();

//   // Check for status and transaction reference from URL params after redirect
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const status = params.get('status');
//     const vnp_TxnRef = params.get('vnp_TxnRef');

//     if (status === 'true' && vnp_TxnRef) {
//       // Update card list after successful payment
//       fetchCards();
//     }
//   }, [location]);

//   // Fetch existing cards
//   const fetchCards = async () => {
//     try {
//       // Replace with your actual API endpoint to fetch cards
//       const response = await axios.get('http://localhost:8081/api/user/cards');
//       setCards(response.data);
//     } catch (err) {
//       setError('Failed to fetch cards');
//       console.error('Error fetching cards:', err);
//     }
//   };

//   useEffect(() => {
//     fetchCards();
//   }, []);

//   const handleGenerateToken = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await axios.post(
//         'http://localhost:8081/api/user/generate-token',
//         {
//           username,
//           cardType,
//           bankCode
//         }
//       );

//       // Redirect to the payment URL
//       if (response.data) {
//         window.location.href = response.data;
//       }
//     } catch (err) {
//       setError('Failed to generate payment token');
//       console.error('Error generating token:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
//       <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Payment Methods</h2>

//       {/* Form to add new payment method */}
//       <div style={{ 
//         backgroundColor: '#f8f9fa',
//         padding: '20px',
//         borderRadius: '8px',
//         marginBottom: '20px'
//       }}>
//         <h3>Add New Payment Method</h3>
//         <form onSubmit={handleGenerateToken}>
//           <div style={{ marginBottom: '15px' }}>
//             <label style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '8px',
//                 borderRadius: '4px',
//                 border: '1px solid #ddd'
//               }}
//               required
//             />
//           </div>

//           <div style={{ marginBottom: '15px' }}>
//             <label style={{ display: 'block', marginBottom: '5px' }}>Card Type:</label>
//             <select
//               value={cardType}
//               onChange={(e) => setCardType(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '8px',
//                 borderRadius: '4px',
//                 border: '1px solid #ddd'
//               }}
//               required
//             >
//               <option value="">Select Card Type</option>
//               <option value="VISA">VISA</option>
//               <option value="MASTERCARD">MASTERCARD</option>
//               <option value="JCB">JCB</option>
//             </select>
//           </div>

//           <div style={{ marginBottom: '15px' }}>
//             <label style={{ display: 'block', marginBottom: '5px' }}>Bank Code:</label>
//             <select
//               value={bankCode}
//               onChange={(e) => setBankCode(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '8px',
//                 borderRadius: '4px',
//                 border: '1px solid #ddd'
//               }}
//               required
//             >
//               <option value="">Select Bank</option>
//               <option value="NCB">NCB Bank</option>
//               <option value="VNPAY">VNPAY</option>
//               <option value="VIETCOMBANK">Vietcombank</option>
//               <option value="TECHCOMBANK">Techcombank</option>
//             </select>
//           </div>

//           {error && (
//             <div style={{ 
//               color: 'red', 
//               padding: '10px', 
//               backgroundColor: '#ffeeee', 
//               marginBottom: '15px',
//               borderRadius: '4px'
//             }}>
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               padding: '10px 15px',
//               backgroundColor: '#4CAF50',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               opacity: loading ? 0.7 : 1
//             }}
//           >
//             {loading ? 'Processing...' : 'Add Payment Method'}
//           </button>
//         </form>
//       </div>

//       {/* Display existing cards */}
//       <div>
//         <h3>Your Payment Methods</h3>
//         {cards.length === 0 ? (
//           <p>No payment methods found</p>
//         ) : (
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
//             gap: '15px'
//           }}>
//             {cards.map((card, index) => (
//               <div
//                 key={index}
//                 style={{
//                   backgroundColor: '#e8f4f8',
//                   padding: '15px',
//                   borderRadius: '8px',
//                   border: '1px solid #cce5ff'
//                 }}
//               >
//                 <div style={{ marginBottom: '5px' }}><strong>Username:</strong> {card.username}</div>
//                 <div style={{ marginBottom: '5px' }}><strong>Card Number:</strong> {card.cardNumber}</div>
//                 <div style={{ marginBottom: '5px' }}><strong>Card Type:</strong> {card.cardType}</div>
//                 <div><strong>Bank Code:</strong> {card.bankCode}</div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PaymentMethodPage;
