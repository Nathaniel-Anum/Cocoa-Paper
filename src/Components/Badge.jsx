
const Badge = ({value, ...props}) => {
    return (
        <div {...props} >
            {value}
        </div>
    );
};

export default Badge;