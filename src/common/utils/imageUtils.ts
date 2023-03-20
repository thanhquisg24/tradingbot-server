export const getMystoryBoxImageUrl = (image: any) => {
  return `${process.env.PREFIX_MYSTORY_URL}${image}.png`;
};

export const getWeaponImageUrl = (image: any) => {
  return `${process.env.PREFIX_WEAPON_PROTOTYPE_URL}${image}.png`;
};
