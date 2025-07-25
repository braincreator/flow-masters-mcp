import { useRouter } from 'next/navigation'

export const BackButton = () => {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2 h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      Назад
    </button>
  )
}
