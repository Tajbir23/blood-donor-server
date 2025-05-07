import { bangladeshGeoData } from "../../utils/bangladeshGeoLoactionData";

const hasAddressId = (targetId: string): boolean => {
    return bangladeshGeoData.divisions.some(division => 
      division.id === targetId ||
      division.districts.some(district =>
        district.id === targetId ||
        district.thanas.some(thana => thana.id === targetId)
      )
    );
  };
  
  export default hasAddressId;