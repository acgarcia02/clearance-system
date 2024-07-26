import React, { useState } from "react";
import Select from "react-select";
import * as FaIcons from "react-icons/fa";

const FilterPopup = ({
  isOpen,
  onClose,
  requests,
  setFilteredRequests,
  unit,
}) => {
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [selectedDegProg, setSelectedDegProg] = useState([]);
  const [selectedReason, setSelectedReason] = useState([]);

  const statusOptions = [
    { value: "Cleared", label: "Cleared" },
    { value: "Pending", label: "Pending" },
    { value: "Withheld", label: "Withheld" },
  ];

  const dateOptions = [
    { value: "Today", label: "Today" },
    { value: "This Week", label: "This Week" },
    { value: "This Month", label: "This Month" },
  ];

  const degProgOptions = [
    { value: "BA Communication Arts", label: "BACA" },
    { value: "BA Sociology", label: "BASOC" },
    { value: "BA Philosophy", label: "BAPHLO" },
    { value: "BS Applied Mathematics", label: "BSAM" },
    { value: "BS Applied Physics", label: "BSAP" },
    { value: "BS Biology", label: "BSBIO" },
    { value: "BS Chemistry", label: "BSCHEM" },
    { value: "BS Computer Science", label: "BSCS" },
    { value: "BS Mathematics", label: "BSMATH" },
    { value: "BS Mathematics and Science Teaching", label: "BSMST" },
    { value: "BS Statistics", label: "BSSTAT" },
  ];

  const reasonOptions = [
    { value: "Graduating", label: "Graduating" },
    { value: "Transferring to UP CU", label: "Transferring to UP CU" },
    {
      value: "Transferring to Other School",
      label: "Transferring to Other School",
    },
  ];

  const filterByDate = (requestDate, selectedDateRange) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    if (selectedDateRange.length === 0) {
      return true;
    }

    for (let range of selectedDateRange) {
      const selectedRange = range.value;

      if (
        selectedRange === "Today" &&
        new Date(requestDate).toDateString() === today.toDateString()
      ) {
        return true;
      } else if (
        selectedRange === "This Week" &&
        new Date(requestDate) >= startOfWeek &&
        new Date(requestDate) <= endOfWeek
      ) {
        return true;
      } else if (
        selectedRange === "This Month" &&
        new Date(requestDate) >= startOfMonth &&
        new Date(requestDate) <= endOfMonth
      ) {
        return true;
      }
    }

    return false;
  };

  const filterByStatus = (request, selectedStatus) => {
    if (selectedStatus.length === 0) {
      return true;
    } else {
      const statusValues = selectedStatus.map((status) => status.value);
      const status = request.status[unit];
      const clearedCount = request.status.filter(
        (status) => status.status === "Cleared"
      ).length;
      if (
        unit === 8 &&
        statusValues.includes("Pending") &&
        clearedCount !== 8 &&
        (!status || status.status !== "Withheld")
      ) {
        return true;
      } else if (
        statusValues.includes("Pending") &&
        status &&
        status.status === "Pending"
      ) {
        return true;
      }
      if (
        unit === 8 &&
        statusValues.includes("Cleared") &&
        clearedCount === 8
      ) {
        return true;
      } else if (
        statusValues.includes("Cleared") &&
        status &&
        status.status === "Cleared"
      ) {
        return true;
      }
      if (
        statusValues.includes("Withheld") &&
        status &&
        status.status === "Withheld"
      ) {
        return true;
      }
      return false;
    }
  };

  const filterByDegProg = (degProg, selectedDegProg) => {
    if (selectedDegProg.length === 0) {
      return true;
    } else {
      return selectedDegProg.some((selected) => selected.value === degProg);
    }
  };

  const filterByReason = (reason, isUPCampus, selectedReason) => {
    if (selectedReason.length === 0) {
      return true;
    } else {
      const selectedReasons = selectedReason.map((reason) => reason.value);
      if (
        (reason === "Graduating" && selectedReasons.includes("Graduating")) ||
        (reason === "Transferring" &&
          isUPCampus &&
          selectedReasons.includes("Transferring to UP CU")) ||
        (reason === "Transferring" &&
          !isUPCampus &&
          selectedReasons.includes("Transferring to Other School"))
      ) {
        return true;
      }
    }
    return false;
  };

  const applyFilters = () => {
    let filtered = requests.filter((request) => {
      return (
        filterByStatus(request, selectedStatus) &&
        filterByDate(request.dateCreated, selectedDateRange) &&
        filterByDegProg(
          request.student.studentDetails.degreeProgram,
          selectedDegProg
        ) &&
        filterByReason(request.reason, request.isUPCampus, selectedReason)
      );
    });

    setFilteredRequests(filtered);
    onClose();
  };

  const closePopup = () => {
    setSelectedStatus([]);
    setSelectedDateRange([]);
    setSelectedDegProg([]);
    setSelectedReason([]);
    onClose();
  };

  return (
    <div className={`popup-overlay ${isOpen ? "open" : ""}`}>
      <div className="popup-container">
        <button className="close-button" onClick={closePopup}>
          <FaIcons.FaTimes />
        </button>
        <h3>
          <FaIcons.FaFilter className="icon" /> Filter
        </h3>
        <div className="select-container">
          <p>Status</p>
          <Select
            isMulti
            placeholder=""
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />
        </div>
        <div className="select-container">
          <p>Date Requested</p>
          <Select
            isMulti
            placeholder=""
            options={dateOptions}
            value={selectedDateRange}
            onChange={setSelectedDateRange}
          />
        </div>
        <div className="select-container">
          <p>Degree Program</p>
          <Select
            isMulti
            placeholder=""
            options={degProgOptions}
            value={selectedDegProg}
            onChange={setSelectedDegProg}
          />
        </div>
        <div className="select-container">
          <p>Reason</p>
          <Select
            isMulti
            placeholder=""
            options={reasonOptions}
            value={selectedReason}
            onChange={setSelectedReason}
          />
        </div>
        <div className="popup-button-container">
          <button className="popup-button" onClick={applyFilters}>
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
