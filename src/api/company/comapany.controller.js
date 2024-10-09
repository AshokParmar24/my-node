const Companys = require("../company/company.model");

const createCompany = async (req, res) => {
  try {
    const existingCompany = await Companys.findOne({ email: req?.body?.email });
    if (existingCompany) {
      res.status(500).json({ message: "Company alredy exist", status: false });
    }
    const newCompany = await new Companys(req.body);
    newCompany.save();
    res.status(200).json({
      message: "Company created successfully",
      status: true,
      company: newCompany,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const getCompaniesGroupedByUser = async (req, res) => {
  try {
    const companyGroup = await Companys.aggregate([
      {
        $group: {
          _id: "$userId", // Group by userId
          companies: { $push: "$$ROOT" }, // Push the entire document into the companies array
        },
      },
      {
        $lookup: {
          from: "users", // Name of the Users collection
          localField: "_id", // Field in the Companys collection
          foreignField: "_id", // Field in the Users collection
          as: "user", // Output field
        },
      },
      {
        $unwind: "$user", // Unwind the user array to include user details
      },
      {
        $project: {
          _id: 0,
          userData: { name: "$user.name", _id: "$user._id" }, // Include the user's name
          companies: 1,
          // Include the companies array
        },
      },
    ]);
    res.status(500).json({
      message: "comapny retirved group wise",
      status: true,
      data: companyGroup,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

const updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const updateData = req.body;

    // Find and update the company
    const updatedCompany = await Companys.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true }
    );

    if (!updatedCompany) {
      return res
        .status(404)
        .json({ message: "Company not found", status: false });
    }

    res.status(200).json({
      message: "Company updated successfully",
      data: updatedCompany,
      status: true,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({
      message: "An error occurred while updating the company",
      status: false,
    });
  }
};

const deleteCompany = async (req, res) => {
  if (!req.params.id) {
    return res
      .status(400)
      .json({ status: false, message: "Company ID is required" });
  }

  const existingCompany = await Companys.findOne({
    _id: req.params.id,
    isOpen: true,
  });
  if (!existingCompany) {
    return res
      .status(400)
      .json({ status: false, message: "Company not found or already deleted" });
  }

  const deleteCompany = await Companys.findByIdAndUpdate(
    existingCompany?.id,
    { isOpen: false },
    { new: true }
  );
  if (deleteCompany) {
    res.status(200).json({
      status: true,
      message: "Company deleted successfully",
    });
  }
};

module.exports = {
  createCompany,
  getCompaniesGroupedByUser,
  updateCompany,
  deleteCompany,
};
