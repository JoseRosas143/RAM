import React, { useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { addPet } from '../services/pets';

const AddPet = () => {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let photoURL = '';
      if (photo) {
        const photoRef = ref(storage, `pets/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      await addPet({
        name,
        breed,
        age,
        microchip,
        photoURL,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div>
      <h2>Add a new Pet</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Pet's Name" required />
        <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="Breed" />
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" />
        <input type="text" value={microchip} onChange={(e) => setMicrochip(e.target.value)} placeholder="Microchip" />
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
        <button type="submit">Add Pet</button>
      </form>
    </div>
  );
};

export default AddPet;
