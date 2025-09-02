import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const PetPublic = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const fetchPet = async () => {
      const petDoc = await getDoc(doc(db, 'pets', petId));
      if (petDoc.exists()) {
        const petData = petDoc.data();
        setPet(petData);
        const ownerDoc = await getDoc(doc(db, 'users', petData.ownerId));
        if (ownerDoc.exists()) {
          setOwner(ownerDoc.data());
        }
      }
    };
    fetchPet();
  }, [petId]);

  if (!pet) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{pet.name}</h2>
      {pet.photoURL && <img src={pet.photoURL} alt={pet.name} style={{ width: '200px' }} />}
      <p>Breed: {pet.breed}</p>
      <p>Age: {pet.age}</p>
      {owner && (
        <a href={`https://wa.me/${owner.phone}`}>Contact Owner</a>
      )}
    </div>
  );
};

export default PetPublic;
