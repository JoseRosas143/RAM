import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import DigitalPetCard from '../components/DigitalPetCard';

const Dashboard = () => {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    if (auth.currentUser) {
      const q = query(collection(db, 'pets'), where('ownerId', '==', auth.currentUser.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const petsData = [];
        querySnapshot.forEach((doc) => {
          petsData.push({ ...doc.data(), id: doc.id });
        });
        setPets(petsData);
      });
      return () => unsubscribe();
    }
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <Link to="/add-pet">Add a new Pet</Link>
      <div>
        <h3>Your Pets</h3>
        {pets.map((pet) => (
          <DigitalPetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
