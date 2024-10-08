import {
	HiOutlineViewGrid,
	HiOutlineCube,
	HiOutlineShoppingCart,
	HiOutlineUsers,
	HiOutlineDocumentText,
	HiOutlineAnnotation,
	HiOutlineQuestionMarkCircle,
	HiOutlineCog
} from 'react-icons/hi'

export const DASHBOARD_SIDEBAR_LINKS = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		path: '/app',
		icon: <HiOutlineViewGrid />
	},
	{
		key: 'products',
		label: 'Products',
		path: '/app/product',
		icon: <HiOutlineCube />
	},
	{
		key: 'citem',
		label: 'Add Campaign Item',
		path: '/app/citem',
		icon: <HiOutlineShoppingCart />
	},{
				key: 'campaign',
				label: 'Campaign',
				path: '/app/campaign',
				icon: <HiOutlineCog />
			},
			{
				key: 'Admin',
				label: 'Admin',
				path: '/app/Admin',
				icon: <HiOutlineUsers />
			}]

