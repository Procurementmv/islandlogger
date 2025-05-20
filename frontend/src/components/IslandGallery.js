import { useState } from 'react';

const IslandGallery = ({ photos = [] }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  
  // If no photos, use a placeholder
  if (photos.length === 0) {
    photos = [
      {
        url: "https://images.unsplash.com/photo-1599147407908-8e36d88b9308?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        caption: "Crystal clear waters of the Maldives"
      },
      {
        url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        caption: "Aerial view of tropical islands"
      },
      {
        url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        caption: "Tropical beach with palm trees"
      },
      {
        url: "https://images.unsplash.com/photo-1540964589711-618b4e6ccc85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        caption: "Overwater bungalows"
      }
    ];
  }
  
  // Open the gallery modal with a specific photo
  const openModal = (index) => {
    setActivePhotoIndex(index);
    setModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  // Close the gallery modal
  const closeModal = () => {
    setModalOpen(false);
    // Re-enable scrolling
    document.body.style.overflow = 'unset';
  };
  
  // Navigate to previous photo in modal
  const prevPhoto = () => {
    setActivePhotoIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };
  
  // Navigate to next photo in modal
  const nextPhoto = () => {
    setActivePhotoIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!modalOpen) return;
    
    if (e.key === 'ArrowLeft') {
      prevPhoto();
    } else if (e.key === 'ArrowRight') {
      nextPhoto();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };
  
  // Add keyboard event listener
  useState(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalOpen]);
  
  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4">Island Gallery</h3>
      
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-200 aspect-square"
            onClick={() => openModal(index)}
          >
            <img 
              src={photo.url} 
              alt={photo.caption || `Island photo ${index + 1}`} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
      
      {/* Lightbox Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center" onClick={closeModal}>
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center p-4">
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-70 p-2 rounded-full z-[60]"
              onClick={closeModal}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation buttons */}
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-[60]"
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 p-2 rounded-full z-[60]"
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Active Photo */}
            <div 
              className="w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={photos[activePhotoIndex].url} 
                alt={photos[activePhotoIndex].caption || `Island photo ${activePhotoIndex + 1}`} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            {/* Caption */}
            {photos[activePhotoIndex].caption && (
              <div className="absolute bottom-8 left-0 right-0 text-center text-white bg-black bg-opacity-60 p-2">
                <p>{photos[activePhotoIndex].caption}</p>
                <p className="text-sm text-gray-300">Photo {activePhotoIndex + 1} of {photos.length}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IslandGallery;