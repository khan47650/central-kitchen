import uiColors from "./uiColors";

export const darkSelectStyle = {
  color: uiColors.text.primary, 
  "& .MuiSelect-select": {
    color: uiColors.text.primary,
    bgcolor: uiColors.card, 
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: uiColors.text.primary, 
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: uiColors.text.primary,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: uiColors.text.primary,
  },
  "& .MuiSvgIcon-root": {
    color: uiColors.text.primary, 
  },
  "& .MuiOutlinedInput-root": {
    bgcolor: uiColors.card, 
  },
};

export const darkSelectMenuProps = {
  PaperProps: {
    sx: {
      bgcolor: uiColors.card,
      color: uiColors.text.primary,
    },
  },
};