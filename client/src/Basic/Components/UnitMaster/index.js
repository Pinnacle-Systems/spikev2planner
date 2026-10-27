import React, { useCallback, useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { toast } from "react-toastify";
import {
  useAddCountryMutation,
  useDeleteCountryMutation,
  useGetCountriesQuery,
  useGetCountryByIdQuery,
  useUpdateCountryMutation,
} from "../../../redux/services/CountryMasterService";

import { TextInput, ToggleButton, ReusableTable, TextInputNew, TextInputNew1, DropdownInputNew } from "../../../Inputs";
import { statusDropdown } from "../../../utils/DropdownData";
import Modal from "../../../UiComponents/Modal";

import { push } from "../../../redux/features/opentabs";
import { useDispatch, useSelector } from "react-redux";

import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";
import { useFormKeyboardNavigation } from "../../../CustomHooks/useFormKeyboardNavigation";
import MasterPageLayout from "../MasterPageLayout";
import SearchableTableCellSelect from "../../ReusabelComponents/SearchableTableCellSelect";
import { useGetLineQuery } from "../../../redux/services/LineMasterService";
import { styleTypeOptions } from "../../../utils/selectOptions";
import TransactionLineItemsSection, { transactionTableClassName, transactionTableFocusCellClassName, transactionTableHeadClassName, transactionTableHeaderCellClassName, transactionTableNumberInputClassName } from "../../ReusabelComponents/TransactionLineItemsSection";
import { useAddUnitMutation, useDeleteUnitMutation, useGetUnitByIdQuery, useGetUnitQuery, useUpdateUnitMutation } from "../../../redux/services/UnitMasterService";
// import { usePermissionForUsers } from "../HasPermission";

const MODEL = "Country Master";

export default function Form({ onSuccess, onClose, editId, deleteId, deleteLabel } = {}) {
  const openTabs = useSelector((state) => state.openTabs);

  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState(editId || deleteId || "");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const { refs, handlers } = useFormKeyboardNavigation();
  const formRef = useRef(null);
  const [lines, setLines] = useState([])
  const childRecord = useRef(0);
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetUnitQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetUnitByIdQuery(id, { skip: !id });

  const [addData] = useAddUnitMutation();
  const [updateData] = useUpdateUnitMutation();
  const [removeData] = useDeleteUnitMutation();



  const {
    data: lineData,
  } = useGetLineQuery({
    params: {
      isGetLinesFromERP: true
    }, searchParams: searchValue,
  });

  const createStandardPriceRow = () => ({
    lineId: "",
    styleType: "",
    offerPrice: "",
    salesPrice: "",
    sku: "",
  });




  const syncFormWithDb = useCallback(
    (data) => {

      if (!id) {
        setLines([createStandardPriceRow()])
      } else {
        setLines(data?.lines)
        setName(data?.name || "");
        setCode(data?.code || "");
        setActive(data?.active ?? true);
        childRecord.current = data?.childRecord ? data?.childRecord : 0;
      }

      setName(data?.name || "");
      setCode(data?.code || "");
      setActive(data?.active ?? true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id]
  );

  useEffect(() => {
    if (singleData?.data) {
      syncFormWithDb(singleData.data);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    code,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    active,
    id,
    lines
  };

  const validateData = (data) => {
    if (data.name && data.code) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id);
      if (onSuccess) {
        await Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
        });
        onSuccess(returnData.data.id);
        return;
      }
      await Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
      });
      if (nextProcess == "new") {
        syncFormWithDb(undefined)
        onNew()
        countryNameRef?.current?.focus();
      } else {
        setForm(false)
        syncFormWithDb(undefined);
      }

    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Submission error',
        text: error.data?.message || 'Something went wrong!',
        didClose: () => {
          countryNameRef?.current?.focus();
        }
      });
    }
  };

  const saveData = (nextProcess) => {
    const upperName = name.toUpperCase();
    const upperCode = code.toUpperCase();

    const finalData = {
      ...data,
      name: upperName,
      code: upperCode
    };

    if (!validateData(finalData)) {
      Swal.fire({
        title: 'Please fill all required fields...!',
        icon: 'error',
        didClose: () => {
          countryNameRef?.current?.focus();
        }
      });
      return;
    }
    let foundItem;

    if (id) {
      foundItem = allData?.data?.filter(i => i.id != id)?.some(item => item?.name.toUpperCase() === upperName);
    } else {
      foundItem = allData?.data?.some(item => item?.name.toUpperCase() === upperName);
    }


    if (foundItem) {
      Swal.fire({
        text: "The Country Name already exists.",
        icon: "warning",
        didClose: () => {
          countryNameRef?.current?.focus();
        }
      });
      return false;
    }
    if (id) {
      if (!window.confirm("Are you sure update the details ...?")) {
        return;
      }
    }
    if (id) {
      handleSubmitCustom(updateData, finalData, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, finalData, "Added", nextProcess);
    }
  };

  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          await Swal.fire({
            icon: 'error',
            title: 'Submission error',
            text: deldata.data?.message || 'Something went wrong!',
          });
          return;
        }
        setId("");
        await Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
        });
        setForm(false);
        syncFormWithDb(undefined);
      } catch (error) {
        await Swal.fire({
          icon: 'error',
          title: 'Submission error',
          text: error.data?.message || 'Something went wrong!',
        });
        setForm(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
  };
  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
  };
  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },

    {
      header: "Country Name",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: "font-medium text-gray-900 text-left uppercase w-72",
      enableSearch: true
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: "font-medium text-gray-900 text-center uppercase w-16",
    },



  ];

  const {
    firstInputRef: countryNameRef,
    toggleButtonRef,
    saveCloseButtonRef,
    saveNewButtonRef,
  } = refs;

  useEffect(() => {
    if ((form || onSuccess) && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form, onSuccess]);

  function handleInputChange(value, index, field) {
    setLines(lines => {
      const newBlend = structuredClone(lines);
      newBlend[index][field] = value;
      return newBlend
    }
    );
  };


  const lineOptions = (id ? lineData?.data : lineData?.data || [])?.map((item) => ({
    value: item.linename,
    label: item?.linename || "",
  }));

  const styleTypeOptions = [{
    value: "regular",
    label: "Regular"
  }, {
    value: "casual",
    label: "Casual"
  }]

  const compactFocusCellClassName = transactionTableFocusCellClassName;
  const compactNumberInputClassName = transactionTableNumberInputClassName;
  const compactHeaderCellClassName = transactionTableHeaderCellClassName;

  const addNewRow = () => {
    const newRow = {
      itemId: "",
      qty: "",
      tax: "0",
      colorId: "",
      uomId: "",
      price: "",
      discountTypes: "",
      discountValue: "0.00",
      id: '',
      poItemsId: "",
      taxMethod: "",
      barcode: "",
      barcodeType: "REGULAR"
    };
    setLines([...lines, newRow]);
  };

  const formBody = (
    <div className="flex-1 p-3 h-[70%]">
      <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
        <div className="grid grid-cols-5 gap-2" ref={formRef}>
          <div className="col-span-2">
            <TextInputNew1
              name="Unit Name"
              type="text"
              value={name}
              setValue={setName}
              required={true}
              readOnly={readOnly}
              ref={countryNameRef}
              disabled={childRecord.current > 0}
            />
          </div>
          <div className="col-span-2">
            <TextInputNew1
              name="Unit Location"
              type="text"
              value={code}
              setValue={setCode}
              required={true}
              readOnly={readOnly}
              disabled={childRecord.current > 0}
              onKeyDown={handlers.handleLastInputKeyDown}
            />
          </div>
          <ToggleButton
            name="Status"
            options={statusDropdown}
            value={active}
            setActive={setActive}
            required={true}
            readOnly={readOnly}
            ref={toggleButtonRef}
            onKeyDown={handlers.handleToggleKeyDown}
          />
        </div>

        <fieldset className="p-0.5 mt-3 min-h-0 h-[90%] overflow-y-auto">
          <TransactionLineItemsSection
            panelClassName="h-full min-h-0"
            contentClassName="min-h-0 overflow-hidden rounded-md border border-slate-200 !py-0"
          >
            <div className="h-full overflow-x-auto overflow-y-auto">
              <table className={transactionTableClassName}>
                <thead className={transactionTableHeadClassName}>
                  <tr>
                    <th className={`${compactHeaderCellClassName} w-12`}>S.No</th>
                    <th className={`${compactHeaderCellClassName} w-12`}>Line Name</th>
                    <th className={`${compactHeaderCellClassName} w-20`}>Style Type</th>
                    <th className={`${compactHeaderCellClassName} w-32`}>Incharge</th>
                    <th className={`${compactHeaderCellClassName} w-16`}>Max Capacity / per day(piece)</th>
                    <th className={`${compactHeaderCellClassName} w-16`}>Efficiency (%)</th>
                    <th className={`${compactHeaderCellClassName} w-32`}>Current Capacity / per day(piece)</th>


                    <th className={`${compactHeaderCellClassName} w-7`}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((row, index) => (
                    <tr
                      key={index}
                      onContextMenu={(e) => {

                      }}
                    >
                      <td className="border border-gray-200 w-10 px-1 py-1 text-center text-xs ">{index + 1}</td>
                      <td className="border border-gray-200 w-16 px-1 py-1 text-left text-xs">
                        <SearchableTableCellSelect
                          value={row.lineId}
                          options={lineOptions}
                          disabled={readOnly}
                          onChange={(nextValue) => handleInputChange(nextValue, index, "lineId")}
                        />
                      </td>
                      <td className="border border-gray-200 w-16 px-1 py-1 text-left text-xs">

                        <SearchableTableCellSelect
                          value={row.styleType}
                          options={styleTypeOptions}
                          disabled={readOnly}
                          onChange={(nextValue) => handleInputChange(nextValue, index, "styleType")}
                        />
                      </td>
                      <td className={`${compactFocusCellClassName} w-40 text-right`}>
                        <input
                          onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                            if (e.key === "Delete") handleInputChange("0.000", index, "inCharge");
                          }}
                          className={compactNumberInputClassName}
                          onFocus={e => e.target.select()}
                          value={row?.inCharge}
                          disabled={readOnly}
                          onChange={e => handleInputChange(e.target.value, index, "inCharge")}
                          onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "inCharge")}
                        />
                      </td>
                      <td className={`${compactFocusCellClassName} w-40 text-right`}>
                        <input
                          onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                            if (e.key === "Delete") handleInputChange("0.000", index, "capacity");
                          }}
                          min="0" type="number"
                          className={compactNumberInputClassName}
                          onFocus={e => e.target.select()}
                          value={row?.capacity}
                          disabled={readOnly}
                          onChange={e => handleInputChange(e.target.value, index, "capacity")}
                          onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "capacity")}
                        />
                      </td>
                      <td className={`${compactFocusCellClassName} w-40 text-right`}>
                        <input
                          onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                            if (e.key === "Delete") handleInputChange("0.000", index, "efficiency");
                          }}
                          min="0" type="number"
                          className={compactNumberInputClassName}
                          onFocus={e => e.target.select()}
                          value={row?.efficiency}
                          disabled={readOnly}
                          onChange={e => handleInputChange(e.target.value, index, "efficiency")}
                          onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "efficiency")}
                        />
                      </td>
                      <td className={`${compactFocusCellClassName} w-40 text-right`}>
                        <input
                          onKeyDown={e => {
                            if (e.code === "Minus" || e.code === "NumpadSubtract") e.preventDefault();
                            if (e.key === "Delete") handleInputChange("0.000", index, "qty");
                          }}
                          min="0" type="number"
                          className={compactNumberInputClassName}
                          onFocus={e => e.target.select()}
                          value={row?.qty}
                          disabled={readOnly}
                          onChange={e => handleInputChange(e.target.value, index, "qty")}
                          onBlur={e => handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")}
                        />
                      </td>
                      <td className="w-16 px-1 py-1 text-center">
                        <button
                          onClick={() => addNewRow()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (index === lines.length - 1) {
                                addNewRow();
                              }
                            }
                          }}
                          className="h-full w-full rounded-none bg-blue-50 py-0"
                        >
                          +
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* 
              {contextMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: `${contextMenu.mouseY - 240}px`,
                    left: `${contextMenu.mouseX - 30}px`,
                    boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
                    padding: "8px", borderRadius: "4px", zIndex: 1000,
                  }}
                  className="bg-gray-100"
                  onMouseLeave={handleCloseContextMenu}
                >
                  <div className="flex flex-col gap-1">
                    <button className="text-black text-[12px] text-left rounded px-1"
                      onClick={() => { handleDeleteRow(contextMenu.rowId); handleCloseContextMenu(); }}>
                      Delete
                    </button>
                    <button className="text-black text-[12px] text-left rounded px-1"
                      onClick={() => { handleDeleteAllRows(); handleCloseContextMenu(); }}>
                      Delete All
                    </button>
                  </div>
                </div>
              )} */}
            </div>
          </TransactionLineItemsSection>
        </fieldset>
      </div>
    </div>
  );


  if (deleteId) {
    const childCount = singleData?.data?.childRecord ?? 0;
    const isLoadingRecord = isSingleFetching || isSingleLoading;

    const handleConfirmDelete = async () => {
      try {
        const res = await removeData(deleteId).unwrap();
        if (res?.statusCode === 1) {
          toast.error(res?.data?.message || "Cannot delete: child records exist");
          return;
        }
        toast.success("Country deleted successfully");
        onSuccess?.();
      } catch (err) {
        toast.error(err?.data?.message || "Failed to delete country");
      }
    };

    return (
      <div className="flex flex-col bg-gray-200 min-h-[250px]">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">Delete Country</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 bg-white mx-3 mt-3 mb-3 rounded">
          {isLoadingRecord ? (
            <p className="text-xs text-gray-400">Checking records...</p>
          ) : childCount > 0 ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-sm font-semibold text-red-600">Cannot Delete</p>
                <p className="text-xs text-gray-600 text-center">
                  <span className="font-semibold">"{deleteLabel}"</span> has{" "}
                  <span className="font-semibold text-red-600">{childCount} linked state{childCount > 1 ? "s" : ""}</span>.
                  Remove them first before deleting this country.
                </p>
              </div>
              <button type="button" onClick={onClose}
                className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
                Close
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700 text-center">
                Are you sure you want to delete{" "}
                <span className="font-semibold">"{deleteLabel}"</span>?
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={onClose}
                  className="px-4 py-1.5 text-xs border border-gray-400 text-gray-600 hover:bg-gray-100 rounded">
                  Cancel
                </button>
                <button type="button" onClick={handleConfirmDelete}
                  className="px-4 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded">
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (onSuccess) {
    return (
      <div onKeyDown={handleKeyDown} className="h-full flex flex-col bg-gray-200">
        <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
          <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
            {editId ? "Edit Country" : "Add New Country"}
          </h2>
          <button
            type="button"
            onClick={() => saveData("close")}
            ref={saveCloseButtonRef}
            onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
            className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 border border-blue-600 flex items-center gap-1 text-xs"
          >
            <Check size={14} />
            {editId ? "Update" : "Save"}
          </button>
        </div>
        {formBody}
      </div>
    );
  }

  return (
    <MasterPageLayout
      title="Unit Master"
      addButtonLabel="+ Add New Unit"
      onAdd={() => {
        setForm(true);
        onNew();
      }}
      onKeyDown={handleKeyDown}
      titleClassName="text-lg font-bold text-gray-800"
    >
      <ReusableTable
        columns={columns}
        data={allData?.data}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={deleteData}
        itemsPerPage={17}
        enableSearch={true}
      />

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[80%] h-[95%]"}
            onClose={() => {
              setForm(false);
              syncFormWithDb(undefined);
              setId("");
            }}
          >
            <div className="h-full flex flex-col  bg-gray-200">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg px-2 py-0.5 font-semibold  text-gray-800">
                    {id
                      ? !readOnly
                        ? "Edit Unit Master"
                        : "Unit Master"
                      : "Add New Unit"}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <div>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(false);
                          setSearchValue("");
                          setId(false);
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("close")
                        }}
                        className="px-3 py-1 hover:bg-blue-600 hover:text-white rounded text-blue-600 
                  border border-blue-600 flex items-center gap-1 text-xs"
                        ref={saveCloseButtonRef} // ✅ Add ref
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveCloseKeyDown(saveData)}
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save & close"}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(!readOnly && !id) && (
                      <button
                        type="button"
                        onClick={() => {
                          saveData("new")
                        }}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                        border border-green-600 flex items-center gap-1 text-xs"
                        ref={saveNewButtonRef} // ✅ Add ref
                        tabIndex={0}
                        onKeyDown={handlers.handleSaveNewKeyDown(saveData)}
                      >
                        <Check size={14} />
                        {"Save & New"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {formBody}
            </div>
          </Modal>
        )}
      </div>
    </MasterPageLayout>
  );
}
