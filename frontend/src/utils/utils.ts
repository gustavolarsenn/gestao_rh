export const PRIMARY_COLOR = "#0369a1";
export const PRIMARY_LIGHT = "#0ea5e9";
export const PRIMARY_LIGHT_BG = "#e0f2ff";
export const SECTION_BORDER_COLOR = "#e2e8f0";

export const primaryButtonSx = {
  backgroundColor: PRIMARY_COLOR,
  color: "white",
  textTransform: "none",
  fontWeight: 600,
  "&:hover": { backgroundColor: PRIMARY_LIGHT },
  "&.Mui-disabled": {
    backgroundColor: PRIMARY_COLOR,
    color: "white",
    opacity: 0.4,
    cursor: "not-allowed",
  },
};