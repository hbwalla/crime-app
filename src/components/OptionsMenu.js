import React from 'react';

const OptionsMenu = ({ options, onToggle }) => {
    return (
        <div style={{
            position: "absolute",
            zIndex: 1,
            top: 50,
            right: 50,
            background: "white",
            padding: "1em",
            border: "1px solid #ccc",
            borderRadius: "8px",
            textAlign: "left",
        }}>
      <strong></strong>
        {options.map((opt) => (
        <div key={opt.id}>
            <input
            type="checkbox"
            id={opt.id}
            checked={opt.checked}
            onChange={() => onToggle(opt.id)}
          />
          <label htmlFor={opt.id}> {opt.label} </label>
        </div>
      ))}
    </div>
  );
};

export default OptionsMenu;