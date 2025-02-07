

export const handleSaveImage = async (svgCode: string,setLoading:React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      const formData = new FormData();
      formData.append('svgCode', svgCode);
  
      const response = await fetch('/api/upload', {
        method: 'PUT',
        body: formData,
      });
      const blob = await response.json();
      if (blob.error) {
        throw new Error(blob.error);
      }
      console.log('Image URL:', blob.url);
      
    } catch (error) {
      console.log(error)
    }finally{
      setLoading(false)
    }
  };
