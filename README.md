# EcoSphere — Environmental Module Backend

Node.js / Express / MongoDB backend for the **Environmental** pillar of the EcoSphere ESG
Management Platform. This is the API-only layer that the existing React frontend
(`Environmental.jsx`, `Charts.jsx`, etc.) will consume via Axios — no frontend code was touched.

## Folder Structure

```
backend/
├── controllers/
│   └── environmentController.js
├── models/
│   ├── Department.js
│   ├── CarbonRecord.js
│   └── Goal.js                  (SustainabilityGoal collection)
├── routes/
│   └── environmentRoutes.js
├── config/
│   └── db.js
├── seed/
│   └── seedData.js              (sample data matching the frontend's mock shapes)
├── postman/
│   └── EcoSphere-Environment.postman_collection.json
├── server.js
├── package.json
└── .env.example
```

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit MONGO_URI / PORT / CLIENT_ORIGIN as needed
npm run seed            # optional: populate sample departments, carbon records, goals
npm run dev              # or `npm start`
```

Server boots on `http://localhost:5000` by default. CORS is enabled for the origin set in
`CLIENT_ORIGIN` (defaults to `*` if unset — set it to your Vite dev server, e.g.
`http://localhost:5173`, for production use).

## Data Model

**Department**
`departmentName` (unique), `manager`, `location`, `employeeCount`, `createdAt`

**CarbonRecord**
`departmentId` (ref → Department), `month`, `year`, `electricityConsumption`, `fuelConsumption`,
`travelEmission`, `wasteEmission`, `totalEmission` (auto-calculated), `createdAt`

`totalEmission = electricityConsumption + fuelConsumption + travelEmission + wasteEmission`
— computed automatically in a Mongoose `pre('validate')` hook, so it's always kept in sync
whether the record is created or edited.

**Goal** (stored in the `sustainabilitygoals` collection)
`goalName`, `targetReduction`, `currentReduction`, `deadline` (must be a future date),
`status` (`Pending` | `In Progress` | `Completed`)

## API Reference

All routes are mounted under `/api`.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/departments` | List all departments |
| POST | `/departments` | Create a department |
| PUT | `/departments/:id` | Update a department |
| DELETE | `/departments/:id` | Delete a department (blocked if it has carbon records) |
| GET | `/carbon` | List carbon records (filter: `?departmentId=&month=&year=`) |
| POST | `/carbon` | Create a carbon record (auto-computes `totalEmission`) |
| PUT | `/carbon/:id` | Update a carbon record (recomputes `totalEmission`) |
| DELETE | `/carbon/:id` | Delete a carbon record |
| GET | `/goals` | List sustainability goals (filter: `?status=`) |
| POST | `/goals` | Create a goal |
| PUT | `/goals/:id` | Update a goal |
| DELETE | `/goals/:id` | Delete a goal |
| GET | `/dashboard/environment` | Total/monthly emission, best/worst department, goal progress, reduction % |
| GET | `/reports/environment` | Monthly data, department ranking, average/highest/lowest emission (filter: `?year=`) |
| GET | `/charts/environment` | Line/bar/pie chart JSON (filter: `?year=`) |

All responses follow `{ success, data | message }`. Validation errors return `400`, not-found
returns `404`, conflicts (duplicate names, existing linked records) return `409`.

### Sample response — `GET /dashboard/environment`

```json
{
  "success": true,
  "data": {
    "totalEmission": 1842,
    "monthlyEmission": 270,
    "bestDepartment": { "departmentId": "...", "departmentName": "Sales & Marketing", "totalEmission": 18 },
    "worstDepartment": { "departmentId": "...", "departmentName": "Manufacturing", "totalEmission": 145 },
    "goalProgress": [
      { "goalName": "Reduce Manufacturing Emissions 20%", "status": "In Progress", "targetReduction": 200, "currentReduction": 120, "progressPercent": 60 }
    ],
    "carbonReductionPercent": 58.24
  }
}
```

### Sample response — `GET /charts/environment`

```json
{
  "success": true,
  "data": {
    "lineChart": { "labels": ["January", "February", "..."], "data": [420, 405, "..."] },
    "barChart": { "labels": ["Manufacturing", "Logistics", "..."], "data": [145, 98, "..."] },
    "pieChart": { "labels": ["Electricity", "Fuel", "Travel", "Waste"], "data": [820, 456, 364, 202] }
  }
}
```

This directly maps onto `Charts.jsx`'s `LineChart` / `BarChart` components in the existing
frontend — swap the mock imports in `carbonData.js` for Axios calls to these endpoints.

## Validation Rules Implemented

- No empty required fields on any Create/Update
- All four emission values must be numeric and `>= 0`
- A `CarbonRecord.departmentId` must reference an existing `Department`
- A `Goal.deadline` must be a future date (enforced both at the schema level and in the
  controller so updates are checked before hitting the DB)
- Duplicate department names and duplicate (department + month + year) carbon records are
  rejected with `409 Conflict`
- A `Department` can't be deleted while it still has linked `CarbonRecord`s

## Testing

Import `postman/EcoSphere-Environment.postman_collection.json` into Postman. It includes every
route with example bodies and collection variables (`departmentId`, `carbonId`, `goalId`) you
can fill in as you create records.
