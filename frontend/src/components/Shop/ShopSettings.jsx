import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/style";
import axios from "axios";
import { loadSeller } from "../../redux/actions/user";
import { toast } from "react-toastify";

const ShopSettings = () => {
  const { seller } = useSelector((state) => state.seller);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState(seller && seller.name);
  const [description, setDescription] = useState(seller && seller.description ? seller.description : "");
  const [address, setAddress] = useState(seller && seller.address);
  const [phoneNumber, setPhoneNumer] = useState(seller && seller.phoneNumber);
  const [zipCode, setZipCode] = useState(seller && seller.zipCode);
  const dispatch = useDispatch();

  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setAvatar(file);

    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    await axios
      .put(`${server}/shop/update-Shop-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then((res) => {
        dispatch(loadSeller);
        toast.success("Avatar updated successfully!");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const updateHandler = async(e) => {
    e.preventDefault();
    await axios.put(`${server}/shop/update-seller-info`, {
        name,
        description,
        address,
        phoneNumber,
        zipCode
    }, {withCredentials:true}).then((res) => {
        toast.success("Shop Info updated")
        dispatch(loadSeller)
    }).catch((error) => {
        toast.error(error.response.data.message)
    })
  };
  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="flex w-full 800px:w-[80%] flex-col justify-center my-5">
        <div className="w-full flex items-center justify-center">
          <div className="relative">
            <img
              src={
                avatar
                  ? URL.createObjectURL(avatar)
                  :  `${seller.avatar?.url}`
                  // `${backend_url}/${seller.avatar}`
              }
              alt=""
              className="w-[150px] h-[150px] rounded-full cursor-pointer"
            />
            <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[10px]">
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={handleImage}
              />
              <label htmlFor="image" className="cursor-pointer">
                <AiOutlineCamera />
              </label>
            </div>
          </div>
        </div>

        {/* shop Info */}

        <form
          aria-aria-required={true}
          className="flex flex-col items-center"
          onSubmit={updateHandler}
        >
          <div className="w-[100%] flex items-center flex-col  800px:w-[50%] mt-5">
            <div className="w-full pl-4">
              <label className="block pb-2">Shop Name</label>
            </div>
            <input
              type="name"
              placeholder={`${seller.name}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col  800px:w-[50%] mt-5">
            <div className="w-full pl-4">
              <label className="block pb-2">Shop Description</label>
            </div>
            <input
              type="description"
              placeholder={`${
                seller?.description
                  ? seller.description
                  : "Enter your shop Description"
              }`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
            />
          </div>

          <div className="w-[100%] flex items-center flex-col  800px:w-[50%] mt-5">
            <div className="w-full pl-4">
              <label className="block pb-2">Shop Address</label>
            </div>
            <input
              type="name"
              placeholder={seller?.address}
              value={address}
              onChange={(e) => setAddress(e.target.value)}

              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col  800px:w-[50%] mt-5">
            <div className="w-full pl-4">
              <label className="block pb-2">Shop Phone Number</label>
            </div>
            <input
              type="number"
              placeholder={seller?.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumer(e.target.value)}

              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col  800px:w-[50%] mt-5">
            <div className="w-full pl-4">
              <label className="block pb-2">Shop Zip Code</label>
            </div>
            <input
              type="number"
              placeholder={seller?.zipCode}
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}

              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col  800px:w-[50%] mt-5">
            <input
              type="submit"
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
              readOnly
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopSettings;
