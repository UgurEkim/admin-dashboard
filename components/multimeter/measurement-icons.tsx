export interface MeasurementModeIconProps {
    className?: string;
}

export function VoltageIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M12 9v30M36 9v30"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M7 14h10M31 34h10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M24 7v34"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="3 3"
                opacity="0.35"
            />

            <path
                d="m21 18 6 0-4 8h5l-7 12 2-9h-5l3-11Z"
                fill="currentColor"
            />
        </svg>
    );
}

export function ResistanceIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M4 24h7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="m11 24 4-7 4 14 4-14 4 14 4-14 4 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M35 24h9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <text
                x="24"
                y="13"
                textAnchor="middle"
                fill="currentColor"
                fontSize="10"
                fontWeight="600"
                fontFamily="monospace"
            >
                Ω
            </text>
        </svg>
    );
}

export function CurrentIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M7 24h34"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M24 7v34"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="3 3"
                opacity="0.35"
            />

            <path
                d="m24 10-6 8h4v9h4v-9h4l-6-8Z"
                fill="currentColor"
            />

            <path
                d="m24 38 6-8h-4v-9h-4v9h-4l6 8Z"
                fill="currentColor"
                opacity="0.55"
            />
        </svg>
    );
}

export function ContinuityIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M5 24h8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M35 24h8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M13 24c4-14 18-14 22 0"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M13 24c4 14 18 14 22 0"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M24 17v14M18 24h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.55"
            />
        </svg>
    );
}

export function DiodeIcon({
    className,
}: MeasurementModeIconProps) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M5 24h11"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />

            <path
                d="M16 12v24l16-12-16-12Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
            />

            <path
                d="M32 12v24"
                stroke="currentColor"
                strokeWidth="2.5"
            />

            <path
                d="M32 24h11"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}