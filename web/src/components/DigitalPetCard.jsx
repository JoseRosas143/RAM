import React from 'react';

const DigitalPetCard = ({ pet }) => {
  const publicProfileUrl = `${window.location.origin}/p/${pet.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
    publicProfileUrl
  )}&size=150x150`;

  return (
    <div style={{ border: '1px solid black', padding: '10px', margin: '10px' }}>
      <h3>{pet.name}</h3>
      <p>Breed: {pet.breed}</p>
      <p>Age: {pet.age}</p>
      {pet.photoURL && <img src={pet.photoURL} alt={pet.name} style={{ width: '100px' }} />}
      <br />
      <img src={qrCodeUrl} alt="QR Code" />
    </div>
  );
};

export default DigitalPetCard;
