import { Helmet } from "react-helmet";
import PropTypes from "prop-types";

const MetaData = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
};

MetaData.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  keywords: PropTypes.string.isRequired,
};

MetaData.defaultProps = {
  title: "Samridhi Enterprises - Exquisite Gold & Diamond Jewelry",
  description:
    "Discover timeless elegance with Samridhi Enterprises. Explore our luxurious gold, diamond, and silver jewelry collections crafted with precision.",
  keywords:
    "Samridhi Enterprises, gold jewelry, diamond rings, silver accessories, wedding jewelry, handcrafted jewelry",
};

export default MetaData;
